import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'packages',
})
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
  })
  code!: string;

  @Column({
    type: 'int',
    unique: true,
    unsigned: true,
  })
  bandwidthMbps!: number;

  @Column({
    type: 'int',
    unsigned: true,
  })
  price!: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
