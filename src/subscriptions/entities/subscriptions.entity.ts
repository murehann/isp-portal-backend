import { Package } from 'src/packages/entities/Package.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SubscriptionsStatusEnum {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  INACTIVE = 'INACTIVE',
}

@Entity()
export class Subscriptions {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @Column({ type: 'varchar', length: 36 })
  packageId!: string;

  @Column({
    type: 'enum',
    enum: SubscriptionsStatusEnum,
    default: SubscriptionsStatusEnum.INACTIVE,
  })
  status!: SubscriptionsStatusEnum;

  @Column({ type: 'date', nullable: true })
  startDate!: Date | null;

  @Column({ type: 'date', nullable: true })
  expireDate!: Date | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  subscriptionCost!: number | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @ManyToOne(() => User, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_SUBSCRIPTION_userId_USER',
  })
  user!: User;

  @ManyToOne(() => Package, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'packageId',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_SUBSCRIPTION_packageId_PACKAGE',
  })
  package!: Package;
}
