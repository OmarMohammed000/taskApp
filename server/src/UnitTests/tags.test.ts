import { Request, Response } from "express";

// Mock the database and utility functions
jest.mock("../models/index.ts", () => ({
  Tags: {
    sequelize: {
      query: jest.fn(),
    }
  },
  Tasks: {
    sequelize: {
      query: jest.fn(),
    }
  }
}));

jest.mock("../utils/isSafe.ts", () => ({
  __esModule: true,
  default: jest.fn(() => true),
}));

// Import actual controllers
import getAllTags from "../controllers/Tags/getAllTags.js";
import getTags from "../controllers/Tags/getTags.js";
import createTag from "../controllers/Tags/createTag.js";
import updateTag from "../controllers/Tags/updateTag.js";
import deleteTag from "../controllers/Tags/deleteTag.js";
import addTagToTask from "../controllers/Tags/addTagToTask.js";
import removeTagFromTask from "../controllers/Tags/removeTagFromTask.js";
import getTasksWithTags from "../controllers/Tags/getTasksWithTags.js";

describe("Tag Controllers Unit Tests", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  const mockDb = require("../models/index.ts");
  const mockIsSafe = require("../utils/isSafe.ts").default;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
    mockIsSafe.mockReturnValue(true);
  });

  describe("getAllTags", () => {
    test("should return all tags successfully", async () => {
      const mockTags = [{ id: 1, name: "tag1" }, { id: 2, name: "tag2" }];
      mockDb.Tags.sequelize.query.mockResolvedValue(mockTags);

      await getAllTags(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTags);
    });

    test("should handle database errors", async () => {
      mockDb.Tags.sequelize.query.mockRejectedValue(new Error("DB Error"));

      await getAllTags(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal server error while fetching tags" });
    });
  });

  describe("getTags", () => {
    test("should return specific tag by id", async () => {
      const mockTag = [{ id: 1, name: "test-tag" }];
      mockReq.params = { id: "1" };
      mockDb.Tags.sequelize.query.mockResolvedValue(mockTag);

      await getTags(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTag);
    });

    test("should return 400 for invalid tag ID", async () => {
      mockReq.params = { id: "invalid" };

      await getTags(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid tag ID" });
    });

    test("should handle database errors", async () => {
      mockReq.params = { id: "1" };
      mockDb.Tags.sequelize.query.mockRejectedValue(new Error("DB Error"));

      await getTags(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal server error while fetching tags" });
    });
  });

  describe("createTag", () => {
    test("should create new tag successfully", async () => {
      const tagData = { name: "new-tag" };
      const createdTag = [{ id: 1, name: "new-tag" }];
      mockReq.body = tagData;
      mockDb.Tags.sequelize.query
        .mockResolvedValueOnce([]) // existingTag check returns empty
        .mockResolvedValueOnce(createdTag); // insert returns new tag

      await createTag(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(createdTag);
    });

    test("should return 400 when request body is missing", async () => {
      mockReq.body = {};

      await createTag(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Request body is missing" });
    });

    test("should return 400 when name is missing", async () => {
      mockReq.body = { other: "field" };

      await createTag(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Missing required fields" });
    });

    test("should return 400 for unsafe input", async () => {
      mockReq.body = { name: "unsafe<script>" };
      mockIsSafe.mockReturnValue(false);

      await createTag(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Input contains unsafe characters" });
    });

    test("should return 409 when tag already exists", async () => {
      mockReq.body = { name: "existing-tag" };
      mockDb.Tags.sequelize.query.mockResolvedValue([{ id: 1, name: "existing-tag" }]);

      await createTag(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Tag already exists" });
    });
  });

  describe("updateTag", () => {
    test("should update tag successfully", async () => {
      const updatedTag = { name: "updated-tag" };
      mockReq.params = { id: "1" };
      mockReq.body = { name: "updated-tag" };
      mockDb.Tags.sequelize.query.mockResolvedValue([[updatedTag]]);

      await updateTag(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ 
        message: "Tag updated successfully",
        tag: updatedTag 
      });
    });

    test("should return 400 when request body is missing", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = {};

      await updateTag(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Request body is missing" });
    });

    test("should return 404 when tag not found", async () => {
      mockReq.params = { id: "999" };
      mockReq.body = { name: "updated-tag" };
      mockDb.Tags.sequelize.query.mockResolvedValue([[]]);

      await updateTag(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Tag not found" });
    });
  });

  describe("addTagToTask", () => {
    test("should add tag to task successfully", async () => {
      mockReq.body = { taskId: 1, tagId: 2 };
      mockDb.Tasks.sequelize.query
        .mockResolvedValueOnce([{ id: 1 }]) // task exists
      mockDb.Tags.sequelize.query
        .mockResolvedValueOnce([{ id: 2 }]) // tag exists
        .mockResolvedValueOnce([]); // insert successful

      await addTagToTask(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Tag added to task successfully" });
    });

    test("should return 400 when request body is missing", async () => {
      mockReq.body = {};

      await addTagToTask(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Request body is missing" });
    });

    test("should return 404 when task not found", async () => {
      mockReq.body = { taskId: 999, tagId: 2 };
      mockDb.Tasks.sequelize.query.mockResolvedValue([]); // task not found

      await addTagToTask(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Task not found" });
    });
  });

  describe("removeTagFromTask", () => {
    test("should remove tag from task successfully", async () => {
      mockReq.body = { taskId: 1, tagId: 2 };
      mockDb.Tags.sequelize.query.mockResolvedValue([{ task_id: 1, tag_id: 2 }]);

      await removeTagFromTask(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Tag removed from task successfully" });
    });

    test("should return 400 for invalid IDs", async () => {
      mockReq.body = { taskId: "invalid", tagId: "invalid" };

      await removeTagFromTask(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid task ID or tag ID" });
    });

    test("should return 404 when tag association not found", async () => {
      mockReq.body = { taskId: 1, tagId: 2 };
      mockDb.Tags.sequelize.query.mockResolvedValue([null]);

      await removeTagFromTask(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Tags not found" });
    });
  });

  describe("getTasksWithTags", () => {
    test("should return tasks with tags successfully", async () => {
      const mockTasks = [{ id: 1, title: "Task 1", tags: ["tag1", "tag2"] }];
      mockReq.params = { id: "1" };
      mockDb.Tasks.sequelize.query.mockResolvedValue(mockTasks);

      await getTasksWithTags(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockTasks);
    });

    test("should return 400 for invalid task ID", async () => {
      mockReq.params = { id: "invalid" };

      await getTasksWithTags(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Missing required parameter: id" });
    });

    test("should handle database errors", async () => {
      mockReq.params = { id: "1" };
      mockDb.Tasks.sequelize.query.mockRejectedValue(new Error("DB Error"));

      await getTasksWithTags(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal server error while fetching tasks with tags" });
    });
  });

  describe("deleteTag", () => {
    test("should delete tag successfully", async () => {
      const mockTag = [{ id: 1, name: "test-tag" }];
      mockReq.params = { id: "1" };
      mockDb.Tags.sequelize.query
        .mockResolvedValueOnce(mockTag) // tag exists check
        .mockResolvedValueOnce([]); // delete operation

      await deleteTag(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Tag deleted successfully" });
    });

    test("should return 400 for invalid tag ID", async () => {
      mockReq.params = { id: "invalid" };

      await deleteTag(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid tag ID" });
    });

    test("should return 404 when tag not found", async () => {
      mockReq.params = { id: "999" };
      mockDb.Tags.sequelize.query.mockResolvedValue([]); // empty array means tag not found

      await deleteTag(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Tag not found" });
    });

    test("should handle database errors", async () => {
      mockReq.params = { id: "1" };
      mockDb.Tags.sequelize.query.mockRejectedValue(new Error("DB Error"));

      await deleteTag(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal server error while deleting tag" });
    });
  });
});
