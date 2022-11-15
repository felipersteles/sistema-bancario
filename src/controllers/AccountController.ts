import { RespostaPadraoMsg } from "../types/RespostaPadraoMsg.type";
import { Request, Response } from "express";
import { accountRepo } from "../database/repositories/AccountRepo";
import { transactionRepo } from "../database/repositories/TransactionsRepo";

export class AccountController {
  async getSaldo(req: Request, res: Response<RespostaPadraoMsg>) {
    const { user_id } = req.params;
    const userAutorizado = req.query.user_id;

    const conta = await accountRepo.find({
      where: {
        user: {
          id: user_id,
        },
      },
    });

    if (conta && conta.length > 0) {
      if (userAutorizado == user_id) return res.status(302).json(conta[0]);
      else return res.status(401).json({ erro: "Não autorizado." });
    } else return res.status(404).json({ erro: "Conta não encontrada" });
  }

  async transferir(req: Request, res: Response<RespostaPadraoMsg>) {
    const userAutorizado = req.query.user_id;
    const { user_id, username, value } = req.body; // username da conta que recebera a transferencia e o valor

    const contaCretidata = await accountRepo.find({
      where: {
        user: {
          id: user_id,
        },
      },
    });
    if (!contaCretidata || contaCretidata.length < 1)
      return res.status(404).json({ erro: "Conta não encontrada" });

    const contaDebitada = await accountRepo.find({
      where: {
        user: {
          username: username,
        },
      },
    });
    if (!contaDebitada || contaDebitada.length < 1)
      return res.status(404).json({ erro: "Conta não encontrada" });

    // Saldo das contas
    var saldoDaContaCreditada = parseFloat(contaCretidata[0].balance);
    var saldoDaContaDebitada = parseFloat(contaDebitada[0].balance);

    if (!contaDebitada || contaDebitada.length < 1)
      return res.status(404).json({ erro: "Conta não encontrada" });

    if (user_id !== userAutorizado)
      return res.status(401).json({ erro: "Não autorizado." });
    else {
      if (saldoDaContaCreditada < value) {
        return res.status(402).json({ erro: "Saldo insuficiente." });
      } else {
        const transferencia = transactionRepo.create({
          value,
          creditedAcc: contaCretidata[0],
          debitedAcc: contaDebitada[0],
        });

        if (await transactionRepo.save(transferencia)) {
          saldoDaContaCreditada -= value;
          saldoDaContaDebitada += value;

          contaCretidata[0].balance = saldoDaContaCreditada.toFixed(2);
          contaDebitada[0].balance = saldoDaContaDebitada.toFixed(2);

          await accountRepo.save(contaCretidata);
          await accountRepo.save(contaDebitada);
        }

        // const transferenciaSemBalance = await transactionRepo.find({
        //   select: {
        //     id: true,
        //     value: true,
        //     createdAt: true,
        //     debitedAcc: {
        //       id: true,
        //       user: {
        //         username: true,
        //       },
        //     },
        //     creditedAcc: {
        //       id: true,
        //       user: {
        //         username: true,
        //       },
        //     },
        //   },
        //   relations: {
        //     debitedAcc: true,
        //     creditedAcc: true,
        //   },
        //   where: {
        //     createdAt: transferencia.createdAt,
        //   },
        // });

        // console.log(transferenciaSemBalance);
        return res.status(201).json(transferencia);
      }
    }
  }

  async listarContas(req: Request, res: Response<RespostaPadraoMsg>) {
    const contas = await accountRepo.find({
      select: {
        id: true,
        balance: true,
        user: {
          username: true,
        },
      },
      relations: {
        user: true,
      },
    });

    return res.status(200).json(contas);
  }

  async listarTransferencias(req: Request, res: Response<RespostaPadraoMsg>) {
    const { user_id, operation } = req.params;
    const userAutorizado = req.query.user_id;

    if (user_id != userAutorizado)
      return res.status(401).json({ erro: "Não autorizado." });

    const conta = await accountRepo.find({
      where: {
        user: {
          id: user_id,
        },
      },
    });
    if (!conta || conta.length < 1)
      return res.status(400).json({ erro: "Erro ao recuperar a conta." });

    // possando o tipo de operacao no parametro para fazer o filtro
    // poderia ser int ou enum
    let historico = null;
    if (operation === "cashout") {
      historico = await transactionRepo.find({
        select: {
          debitedAcc: {
            id: true,
          },
        },
        relations: {
          debitedAcc: true,
        },
        where: {
          creditedAcc: conta,
        },
      });

      historico.forEach((transaction) => {
        transaction.value = "-" + transaction.value;
      });
    } else if (operation === "cashin") {
      historico = await transactionRepo.find({
        select: {
          creditedAcc: {
            id: true,
          },
        },
        relations: {
          creditedAcc: true,
        },
        where: {
          debitedAcc: conta,
        },
      });
    }

    if (historico !== null) return res.status(200).json(historico);
    else return res.status(400).json({ erro: "Erro ao recuperar histórico." });
  }
}
