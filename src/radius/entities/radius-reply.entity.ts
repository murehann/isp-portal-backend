import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'radreply' })
export class RadiusReply {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column()
  attribute!: string;

  @Column()
  op!: string;

  @Column()
  value!: string;
}
