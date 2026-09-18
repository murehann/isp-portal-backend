import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('radpostauth')
export class RadiusPostAuth {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'username', length: 64 })
  username!: string;

  @Column({ name: 'pass', type: 'varchar', length: 64, nullable: true })
  pass!: string | null;

  @Column({ name: 'reply', length: 64 })
  reply!: string;

  @Column({ name: 'authdate', type: 'timestamp' })
  authdate!: Date;
}
