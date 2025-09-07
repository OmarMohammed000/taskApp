CREATE TABLE Levels(
id serial primary key ,
level_number int unique not null,
required_xp int unique not null default 1000 
);
CREATE TABLE Users(
 id serial primary key ,
 name varchar(50) not null ,
 email text unique not null, 
 password_hash text not null,
 xp int DEFAULT 0,
 level_id int  ,
 created_at timestamp DEFAULT NOW(),
 foreign key (level_id) REFERENCES Levels(id)  
);
CREATE TYPE task_category AS ENUM ('todo', 'habit');
CREATE TYPE status_codes AS ENUM ('pending','in_progress','completed');
CREATE TYPE priority AS ENUM ('high','medium','low');

CREATE TABLE Tasks(
 id serial primary key ,
 user_id  int ,
 title text not null ,
 description text ,
 category task_category not null,
 xp_value int not null check (
   (category = 'todo' and xp_value=25) or (category='habit' and xp_value=50)
 ),
 status status_codes not null ,
 due_data timestamp ,
 created_at timestamp not null default NOW(),
 updated_at timestamp 
);
CREATE TABLE Tags(
	id serial primary key ,
	name varchar(50) not null unique 
);
CREATE TABLE Task_tags(
 task_id int ,
 tag_id int,
  FOREIGN KEY (task_id) REFERENCES Tasks(id),
 FOREIGN KEY (tag_id) REFERENCES Tags(id),
 primary key (task_id,tag_id)
);
CREATE INDEX idx_email on Users(email);

-- creating the function first then the trigger 
CREATE OR REPLACE  FUNCTION update_timestamp() 
RETURNS trigger AS $$
BEGIN 
 NEW.updated_at = NOW();
 RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- trigger
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON Tasks
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();