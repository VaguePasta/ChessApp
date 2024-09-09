create table users (
	user_id bigint primary key generated always as identity,
	username text,
	password text,
	join_date date
)