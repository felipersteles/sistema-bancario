import { AppDataSource } from "../datasource";
import { Transaction } from "../entities/Transactions";

export const transactionRepo = AppDataSource.getRepository(Transaction)