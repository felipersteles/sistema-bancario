import { RespostaPadraoMsg } from "../types/RespostaPadraoMsg.type";
import { Request, Response } from "express";
import md5 from "md5";
import jwt, { JwtPayload } from "jsonwebtoken";

// repositorios
import { userRepo } from "../database/repositories/UserRepo";
import { accountRepo } from "../database/repositories/AccountRepo";

// validar token
import { validarTokenJWT } from "../middlewares/validarTokenJWT";

// controla o login e cadastro do usuario
export class UserController {
  async cadastro(req: Request, res: Response<RespostaPadraoMsg>) {
    const { username, password } = req.body; // fazendo desta forma pois é uma req simples

    // validando username
    if (!username || username.length < 2)
      return res.status(400).json({ erro: "Username inválido." });

    const usuarioComMesmoUsername = await userRepo.find({
      where: {
        username: username,
      },
    });

    // utilizando expressao regular pra validar senha
    // RegEx
    const validarSenha =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[0-9a-zA-Z]).{8,}$/;
    if (!validarSenha.test(password))
      return res.status(400).json({ erro: "Senha inválida." });

    // verificando se usuario ja existe
    if (usuarioComMesmoUsername && usuarioComMesmoUsername.length > 0)
      return res.status(400).json({ erro: "Usuário já existe" });

    try {
      const senhaCriptografada = md5(password); // criptografando a senha

      const novaConta = accountRepo.create(); // adiciona uma conta ao usuario
      await accountRepo.save(novaConta);

      const novoUsuario = userRepo.create({
        username,
        password: senhaCriptografada,
        acc: novaConta,
      });
      await userRepo.save(novoUsuario);

      return res.status(200).json(novoUsuario);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ erro: "Erro ao cadastrar usuário." });
    }
  }

  async login(req: Request, res: Response<RespostaPadraoMsg>) {
    const { CHAVE_JWT } = process.env;
    if (!CHAVE_JWT)
      return res.status(500).json({ erro: "Chave JWT não informada." });

    const { username, password } = req.body;

    const usuariosEncontrados = await userRepo.find({
      where: {
        username: username,
        password: md5(password),
      },
    });
    if (usuariosEncontrados && usuariosEncontrados.length > 0) {
      const usuarioALogar = usuariosEncontrados[0];

      //cria token
      const token = jwt.sign({ id: usuarioALogar.id }, CHAVE_JWT, {
        expiresIn: "1d",
      });

      return res.status(200).json({
        username: usuarioALogar.username,
        token: token,
      });
    }

    return res.status(400).json({ erro: "Usuário ou senha incorretos." });
  }

  async listarUsuarios(req: Request, res: Response<RespostaPadraoMsg>) {
    const usuarios = await userRepo.find({
      select: {
        id: true,
        username: true,
        acc: {
          id: true,
          balance: true
        }
      },
      relations: {
        acc: true
      }
    })

    return res.status(200).json(usuarios)
  }
}
