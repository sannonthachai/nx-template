## HOW TO CREATE SCHEMA
Create schema file in directory prisma/schemas/**.prisma

## HOW TO RUN MIGRATION OR MERGE YOUR NEW SCHEMA INTO schema.prisma
Unfortunatly, now prisma not support multiple schema files. It still look at only schema.prisma and you can see that the issue is still not closed 😢  [#2377](https://github.com/prisma/prisma/issues/2377)
So, I used library name `prismix` that provide us to manage our schema files.

You need to pass some variable environmet directly and run the command like this

```
DATABASE_URL=postgresql://root:secret@127.0.0.1:5432/globish_order yarn migration order-service  --name=${migration_name}
```
** migration_name is a word or sentence that you represent your action for example  --name=create_order_instance_table


