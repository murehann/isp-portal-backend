import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'packages',
})
export class Package {
  @PrimaryGeneratedColumn({
    type: 'smallint',
    unsigned: true,
  })
  id!: number;

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
    unsigned: true,
  })
  downloadBandwidthMbps!: number;

  @Column({
    type: 'int',
    unsigned: true,
  })
  uploadBandwidthMbps!: number;

  @Column({
    type: 'int',
    unsigned: true,
  })
  price!: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'datetime' })
  deletedAt!: Date | null;
}
