
#### JWT Authentication `headers: { "Authorization": "Bearer <token>" }`

  

## Authentications

#### Login

##### Body `{ email, password }`

```
POST /api/auth/login
```
##### Response `{ token, user }`
  
#### Register

##### Body `{ email, password, tel_number, name }`

```
POST /api/auth/register
```

##### Response `{ user }`


## User

#### Get my profile

```
GET /api/users/me
```
##### Response `{ token, user }`
  
#### View user

```
GET /api/users/<uid>
```
  

#### Edit user info

```
PATCH /api/users
```
##### Payload user data

#### Venture sign up

##### Payload `{ certificate_number, company_name, type, address, tel_number, avatar }`

```
POST /api/users/venture_signup
```


## Job

#### Create job

##### Payload `{ title, dept, wage, description, start_time, end_time, welfare, images }`

```
POST /api/jobs
```

#### Get all jobs

```
GET /api/jobs
```


#### Get job's venture

```
GET /api/venture/<venture_id>/jobs
```

 

#### Edit job info

##### Payload `{ title, dept, wage, description, start_time, end_time, welfare }`

```
PATCH /api/jobs/<job_id>
```

#### Delete job

```
DELETE /api/jobs/<jobId>
```
  

## Apply

#### Create apply

```
POST /api/applies
```
##### Payload `{ job_id }`
  

#### Get venture job applies

```
GET /api/ventures/<venture_id>/applies
```

#### Get user job applies

```
GET /api/applies?employee_id=<employee_id>
```
  
#### Update apply status

##### Payload `{ "status": "approve" || "completed" || "reject" }`

```
PATCH /api/applies/<apply_id>
```

#### Delete apply

```
DELETE /api/applies/<apply_id>
```


## Review

#### Create review

##### Payload `{ description, rating }`

```
POST /api/reviews
```

#### Get review's user

```
GET /api/users/<user_id>?q=job
```
  
#### Edit review

##### Payload `{ description }`

```
PATCH /api/reviews/<review_id>
```


### Delete review

```
DELETE /api/reviews/<review_id>
```


## Bookmark

#### Create bookmark

```
POST /api/bookmarks/<job_id>
```

#### Get all user's bookmarks

```
GET /api/bookmarks
```

#### Delete bookmark

```
DELETE /api/bookmarks/<bookmarkId>
```