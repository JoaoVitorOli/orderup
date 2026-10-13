import { Migration } from '@mikro-orm/migrations';

export class Migration20261013210451 extends Migration {

  override name = 'Migration20261013210451';

  override up(): void | Promise<void> {
    this.addSql(`create table "menu_item" ("id" uuid not null, "name" varchar(255) not null, "quantity" int not null, "price" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`);

    this.addSql(`create table "order" ("id" uuid not null, "code" varchar(6) not null, "name" varchar(255) not null, "created_by" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`);
    this.addSql(`alter table "order" add constraint "order_code_unique" unique ("code");`);
  }

}
