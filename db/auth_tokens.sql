create table if not exists auth_tokens (
	selector text not null primary key,
	hashed_validator text not null,
	user_id bigint references users(user_id) on delete cascade,
	expires timestamp(0)
);
create view current_auth_tokens as select * from auth_tokens where expires >= localtimestamp(0)