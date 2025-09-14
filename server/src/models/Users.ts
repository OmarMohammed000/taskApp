import { ref } from "process";
import { DataTypes, Sequelize, Model,Optional} from "sequelize";

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  xp?: number;
  level_id?: number;
  createdAt?: Date;
  refresh_token?: string;
  isAdmin?: boolean;
}
type UserCreationAttributes = Optional<UserAttributes, 'id'| 'xp' | 'level_id' | 'createdAt'>;
const Users = (sequelize: Sequelize) => {
  return sequelize.define<Model<UserAttributes, UserCreationAttributes>>("Users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    xp: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    level_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references:{
        model: 'Levels',
        key: 'id'
      }
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: "Users",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);
}
export default Users;