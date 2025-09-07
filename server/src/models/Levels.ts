import { DataTypes, Sequelize, Model,Optional} from "sequelize";

interface LevelAttributes {
  id: number;
  level_number: number;
  required_xp: number;
}
type LevelCreationAttributes = Optional<LevelAttributes, 'id'>;
const Levels = (sequelize: Sequelize) => {
  return sequelize.define<Model<LevelAttributes, LevelCreationAttributes>>("Levels", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    level_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    required_xp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000,
      unique: true
    }
  }, {
    tableName: "Levels",
    updatedAt: false,
    createdAt: false  
  }
);
}
export default Levels;