create table if not exists game_records (
	game_id bigint primary key generated always as identity,
	white_player bigint references users(user_id),
	black_player bigint references users(user_id),
	moves bytea,
	date_added timestamp(0)
);
create function delete_nulled_records()
	returns trigger
	language PLPGSQL as
$$
begin
	delete from game_records where black_player = null and white_player = null;
end;
$$;
create trigger check_delete
after delete on users
execute function delete_nulled_records()

create trigger check_update
after update on game_records
execute function delete_nulled_records()
