import { Subscriptions } from 'src/subscriptions/entities/subscriptions.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum InternetLogonStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}
@Entity({
  name: 'internet_logon',
})
export class InternetLogon {
  @PrimaryGeneratedColumn({
    type: 'smallint',
    unsigned: true,
  })
  id!: number;

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
    type: 'smallint',
    unsigned: true,
    unique: true,
  })
  currentSubscriptionId!: number;

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
    type: 'smallint',
    unsigned: true,
    unique: true,
  })
  userId!: number;

  @OneToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_INTERNET_LOGON_userId_USER',
  })
  user!: User;

  @OneToOne(() => Subscriptions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'currentSubscriptionId',
    referencedColumnName: 'id',
    foreignKeyConstraintName:
      'fk_INTERNET_LOGON_currentSubscriptionId_SUBSCRIPTION',
  })
  currentSubscription!: Subscriptions;

  @Column({ default: false, type: 'boolean' })
  isDeleted!: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'datetime' })
  deletedAt!: Date | null;
}
