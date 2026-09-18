import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index(['username', 'attribute'], { unique: true })
@Entity({ name: 'radreply' })
export class RadiusReply {
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
