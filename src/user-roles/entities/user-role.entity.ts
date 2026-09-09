import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique('UQ_user_role', ['userId', 'roleId'])
export class UserRole {
  @PrimaryGeneratedColumn({
    type: 'smallint',
    unsigned: true,
  })
  id!: number;

  @Column({ type: 'smallint', unsigned: true })
  userId!: number;

  @Column({ type: 'smallint', unsigned: true })
  roleId!: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_user_assigned_roles',
  })
  user!: User;

  @ManyToOne(() => Role, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'roleId',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_roles_assigned_to_users',
  })
  role!: Role;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;
}
