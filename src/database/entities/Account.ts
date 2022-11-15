import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Transaction } from "./Transactions";
import { User } from "./User";

// nome no banco de dados sera no plural
// e sera um conjunto de classes Account
@Entity("Accounts")
export class Account {
  @PrimaryGeneratedColumn() //auto incremento e chave primaria
  id: number;

  @Column({ type: "numeric", default: 100 })
  balance: string;

  @OneToOne(() => User, (user) => user.acc)
  user: User;

  @OneToMany(() => Transaction, (trans) => trans.creditedAcc)
  credited: Transaction[];

  @OneToMany(() => Transaction, (trans) => trans.debitedAcc)
  debited: Transaction[];
}
