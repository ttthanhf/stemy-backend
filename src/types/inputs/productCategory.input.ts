import { Field, InputType } from "type-graphql";
import { CategoryType } from "~constants/category.constant";

@InputType()
export class ProductCategoryInput {
  @Field()
  name!: string;

  @Field()
  title!: string;

  @Field()
  type!: CategoryType;
}

