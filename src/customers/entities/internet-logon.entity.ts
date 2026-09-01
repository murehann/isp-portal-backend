import { Subscriptions } from 'src/subscriptions/entities/subscriptions.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
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
    unique: true,
  })
  currentSubscriptionId!: string;

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

  @OneToOne(() => Subscriptions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'currentSubscriptionId',
    referencedColumnName: 'id',
    foreignKeyConstraintName:
      'fk_INTERNET_LOGON_currentSubscription_SUBSCRIPTION',
  })
  currentSubscription!: Subscriptions;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
