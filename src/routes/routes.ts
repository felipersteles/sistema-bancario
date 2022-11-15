
import { Router } from 'express'
import { AccountController } from '../controllers/AccountController'
import { UserController } from '../controllers/UserController'
import { validarTokenJWT } from '../middlewares/validarTokenJWT'

const routes = Router()

// rotas cadastro e login ambos post
routes.post('/cadastro', new UserController().cadastro)
routes.post('/login', new UserController().login)

// rota para visualizar saldo
routes.get('/saldo/:user_id', validarTokenJWT(new AccountController().getSaldo))
// routes.post('/transferencia/:user_id', validarTokenJWT(new AccountController().transferir))
routes.post('/transferencia', validarTokenJWT(new AccountController().transferir)) // nao se passa parametro em metodo post
routes.get('/transferencias/:user_id/:operation', validarTokenJWT(new AccountController().listarTransferencias))


// rotas de testes
routes.get('/contas', new AccountController().listarContas)
routes.get('/usuarios', new UserController().listarUsuarios) // teste


export default routes