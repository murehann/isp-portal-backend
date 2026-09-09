import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({
    type: 'smallint',
    unsigned: true,
  })
  id!: number;

  @Column({ type: 'varchar', unique: true, length: 100 })
  email!: string;

  @Column({ type: 'varchar', length: 100 })
  displayName!: string;

  @Column({ type: 'varchar', length: 128, select: false })
  password!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  managedById!: number | null;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({
    name: 'managedById',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_user_managed_by',
  })
  managedBy!: User | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;
}
