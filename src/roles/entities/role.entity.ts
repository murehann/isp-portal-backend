import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Check(`"level" >= 0`)
export class Role {
  @PrimaryGeneratedColumn({
    type: 'smallint',
    unsigned: true,
  })
  id!: number;

  @Column({ type: 'varchar', unique: true, length: 30 })
  name!: string;

  @Column({ type: 'varchar', unique: true, length: 30 })
  code!: string;

  @Column({ type: 'int' })
  level!: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'datetime' })
  deletedAt!: Date | null;
}
