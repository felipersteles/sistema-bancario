import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Account } from "./Account";

@Entity("Users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  username: string;

  @Column({ type: "text" })
  password: string;

  // acredito que normalmente um usuario poderia ter varias contas
  // sendo elas de varios tipos, mas para esta aplicação farei desta forma
  @OneToOne(() => Account, (acc) => acc.user)
  @JoinColumn({ name: "acc_id" })
  acc: Account;
}
