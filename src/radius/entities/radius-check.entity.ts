import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'radcheck' })
@Index(['username', 'attribute'], { unique: true })
export class RadiusCheck {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 64 })
  username!: string;

  @Column({ type: 'varchar', length: 64 })
  attribute!: string;

  @Column({ type: 'char', length: 2 })
  op!: string;

  @Column({ type: 'varchar', length: 253 })
  value!: string;
}
