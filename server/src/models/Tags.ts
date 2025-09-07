import { DataTypes, Sequelize, Model,Optional} from "sequelize";

interface TagAttributes {
   id: number;
   name: string;
   description?: string;
}
type TagCreationAttributes = Optional<TagAttributes, 'id'>;
const Tags = (sequelize: Sequelize) => {
  return sequelize.define<Model<TagAttributes, TagCreationAttributes>>("Tags", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
  }, {
    tableName: "Tags",
    timestamps: false
  }
);
}
export default Tags;