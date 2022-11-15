import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Account } from "./Account";

@Entity("Transactions")
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (acc) => acc.credited)
  debitedAcc: Account;

  @ManyToOne(() => Account, (acc) => acc.debited)
  creditedAcc: Account;

  @Column({ type: "numeric" })
  value: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  createdAt: Date;
}
