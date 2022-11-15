import jwt, { JwtPayload } from "jsonwebtoken";
import { RespostaPadraoMsg } from "../types/RespostaPadraoMsg.type";
import { Request, Response, NextFunction } from "express";

export const validarTokenJWT =
  (handler: NextFunction) =>
  (req: Request, res: Response<RespostaPadraoMsg>) => {
    try {
      const { CHAVE_JWT } = process.env;
      if (!CHAVE_JWT)
        return res.status(500).json({ erro: "ENV chave JWT não informada." });

      if (!req || !req.headers)
        return res
          .status(401)
          .json({ erro: "Não foi possivel validar o token de acesso." });

      if (req.method !== "OPTIONS") {
        const { authorization } = req.headers;
        if (!authorization)
          return res
            .status(401)
            .json({ erro: "Não foi possivel validar o authorization." });

        const token = authorization.substring(7);
        if (!token) return res.status(401).json({ erro: "Problema no token" });

        const decoded = jwt.verify(token, CHAVE_JWT) as JwtPayload;
        if (!decoded)
          return res
            .status(401)
            .json({ erro: "Problema ao decodificar o token" });

        if (!req.query) req.query = {};

        req.query.user_id = decoded.id;
      }
    } catch (error) {
      console.log(error);
      return res
        .status(401)
        .json({ erro: "Nao foi possivel validar o token de acesso" });
    }

    return handler(req, res);
  };
