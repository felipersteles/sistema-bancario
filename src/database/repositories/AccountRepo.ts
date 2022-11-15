import { AppDataSource } from "../datasource";
import { Account } from "../entities/Account";

export const accountRepo = AppDataSource.getRepository(Account)

