create table users (
	user_id bigint primary key generated always as identity,
	username text unique,
	password text,
	join_date date,
	win int not null default 0,
	draw int not null default 0,
	loss int not null default 0
)