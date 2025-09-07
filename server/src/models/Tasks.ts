import { DataTypes, Sequelize, Model,Optional} from "sequelize";

interface TaskAttributes {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  category: 'todo' | 'habit';
  xp_value: 25 | 50;
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: Date;
  created_at?: Date;
  updated_at?: Date;
}
type TaskCreationAttributes = Optional<TaskAttributes, 'id'|
 'description' | 'due_date' | 'updated_at'>;
const Tasks = (sequelize: Sequelize) => {
  return sequelize.define<Model<TaskAttributes, TaskCreationAttributes>>("Tasks", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('todo', 'habit'),
      allowNull: false
    },
    xp_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate:{
        isIn: [[25, 50]]
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      allowNull: false
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    tableName: "Tasks",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
}
export default Tasks;

    