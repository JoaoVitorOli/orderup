import { Migration } from '@mikro-orm/migrations';

export class Migration20261015162200 extends Migration {

  override name = 'Migration20261015162200';

  override up(): void | Promise<void> {
    this.addSql(`create table "order_item" ("id" uuid not null, "order_id" uuid not null, "menu_item_id" uuid not null, "quantity" int not null, "unit_price" int not null, "created_at" timestamptz not null, primary key ("id"));`);

    this.addSql(`alter table "order" drop column "created_by", drop column "name";`);
    this.addSql(`alter table "order" add "customer_name" varchar(255) not null, add "status" text not null default 'RECEIVED', add "total" int not null, add "idempotency_key" uuid not null;`);
    this.addSql(`alter table "order" add constraint "order_idempotency_key_unique" unique ("idempotency_key");`);
    this.addSql(`alter table "order" add constraint "order_status_check" check ("status" in ('RECEIVED', 'PREPARING', 'READY'));`);

    this.addSql(`alter table "order_item" add constraint "order_item_order_id_foreign" foreign key ("order_id") references "order" ("id");`);
    this.addSql(`alter table "order_item" add constraint "order_item_menu_item_id_foreign" foreign key ("menu_item_id") references "menu_item" ("id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "order_item" cascade;`);

    this.addSql(`alter table "order" drop constraint "order_idempotency_key_unique";`);
    this.addSql(`alter table "order" drop constraint "order_status_check";`);
    this.addSql(`alter table "order" drop column "status", drop column "total", drop column "idempotency_key";`);
    this.addSql(`alter table "order" add "name" varchar(255) not null;`);
    this.addSql(`alter table "order" rename column "customer_name" to "created_by";`);
  }

}
