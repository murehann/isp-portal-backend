import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'radcheck' })
export class RadiusCheck {
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
