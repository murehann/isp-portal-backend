import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum InternetLogonStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}
// TODO: add proper type script types to all these
@Entity({
  name: 'internet_logon',
})
export class InternetLogon {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  internetLogonUsername!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  internetLogonPassword!: string;

  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    unique: true,
  })
  // TODO: after implementing subscriptions module and creating subscriptions entity refer it here and implement has relationship
  currentSubscriptionId!: string | null; // TODO: null for now but when referencing subscription entity null not allowed

  @Column({
    type: 'varchar',
    length: 17,
    nullable: true,
  })
  registeredDeviceMAC!: string | null;

  @Column({
    type: 'enum',
    enum: InternetLogonStatus,
    default: InternetLogonStatus.OFFLINE,
  })
  status!: InternetLogonStatus;

  @Column({
    type: 'varchar',
    length: 15,
  })
  assignedIP!: string;

  @Column({
    type: 'varchar',
    length: 36,
    unique: true,
  })
  userId!: string;

  @OneToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_INTERNET_LOGON_userId_USER',
  })
  user!: User;
}
