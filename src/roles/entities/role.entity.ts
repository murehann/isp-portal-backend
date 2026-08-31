import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Check(`"level" >= 0`)
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true, length: 30 })
  name!: string;

  @Column({ type: 'varchar', unique: true, length: 30 })
  code!: string;

  @Column({ type: 'int' })
  level!: number;
}
