
import { AppDataSource } from "../datasource";
import { User } from "../entities/User";

export const userRepo = AppDataSource.getRepository(User)


