import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true, length: 100 })
  username!: string;

  @Column({ type: 'varchar', length: 100 })
  displayName!: string;

  @Column({ type: 'varchar', length: 128 })
  password!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'varchar', length: 36, nullable: true }) // using mysql as db, and no native uuid in mysql, and pk uuid stored as varchar(36), so to match with that making it consistent with pk type
  managedById!: string | null;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({
    name: 'managedById',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_user_managed_by',
  })
  managedBy!: User | null;
}
