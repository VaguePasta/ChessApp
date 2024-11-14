create table if not exists puzzles (
	puzzle_id int primary key generated always as identity,
	fen text,
	moves text,
	rating smallint,
	rating_deviation smallint,
	theme text
)