create table game_records (
	game_id bigint primary key generated always as identity,
	white_player bigint references users(user_id),
	black_player bigint references users(user_id),
	moves bytea
)