/*-----------------FILES-------------------*/
export const VALID_IMAGES_TYPES: RegExp = /(:jpg|jpeg|png|webp)/;
export const VALID_VIDEO_TYPES: string = 'mp4';
export const MOVIES: string = '/movies';
export const POSTERS: string = '/posters';
export const POSTERS_MIN: string = '/posters-min';
export const PHOTOS: string = '/actors-photos';

/*-----------------PATHS-------------------*/
export const ID_TERM = ':id';
export const BY_SLUG = 'slug/:slug';
export const BY_ID = 'id/:id';

/*---ACTORS---*/
export const ACTORS_PREFIX = 'actors';
export const BY_PHOTO_ID = 'photo/:id';
export const PHOTO_FIELD_NAME = 'photo';

/*---AUTH---*/
export const AUTH_PREFIX = 'auth';
export const REGISTER = 'register';
export const LOGIN = 'login';
export const GET_TOKEN = 'get-new-tokens';

/*---FILES---*/
export const FILES_PREFIX = 'files';
export const FILE_FIELD_NAME = 'file';

/*---GENRES---*/
export const GENRES_PREFIX = 'genres';
export const COLLECTIONS = 'collections';

/*---MOVIES---*/
export const MOVIES_PREFIX = 'movies';
export const MOST_POPULAR = 'most-popular';
export const ACTOR_BY_ID = 'actor/:id';
export const BY_GENRE = 'by-genre';
export const POSTER_BY_ID = 'poster/:id';
export const VIDEO_BY_ID = 'video/:id';
export const UPDATE_OPEN_COUNT = 'update-count-opened';
export const POSTER_FIELD_NAME = 'poster';
export const VIDEO_FIELD_NAME = 'video';

/*---RATINGS---*/
export const RATINGS_PREFIX = 'ratings';
export const SET_RATING = 'set-rating';

/*---USERS---*/
export const USERS_PREFIX = 'users';
export const PROFILE = 'profile';
export const GET_COUNT = 'count';
export const FAVORITES = 'favorites';
export const TOGGLE_ADMIN_STATUS_BY_ID = 'set-admin/:id';

/*-----------------EXCEPTIONS-------------------*/
export const BAD_REQUEST = 'BAD_REQUEST';
export const ALREADY_EXIST = 'ALREADY_EXIST';
export const NOT_FOUND = 'NOT_FOUND';
export const FORBIDDEN = 'FORBIDDEN';
export const INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';
export const UNAUTHORIZED = 'UNAUTHORIZED';
export const UPLOAD_FILE_ERROR = 'UPLOAD_FILE_ERROR';

/*-----------------ROLES-------------------*/
export const ADMIN = 'admin';
export const USER = 'user';

/*-----------------IMAGES------------------*/
export const OPTIMIZED_IMAGE_PREFIX = 'optimized-';
export const WEBP = '.webp';

/*-----------------COMMON-------------------*/
export const ID = 'id';
export const SLUG = 'slug';
export const SEARCH_TERM = 'searchTerm';
export const DEFAULT_GENRE_ICON = 'MdSportsKabaddi';
export const DEVELOPMENT = 'development';
export const GLOBAL_PREFIX = 'api';
