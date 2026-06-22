# RMS Frontend — Angular 17

## Prerequisites
- Node.js 18+
- npm 9+
- Angular CLI: `npm install -g @angular/cli`

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API URL
Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### 3. Run Development Server
```bash
ng serve
```
Open: http://localhost:4200

## Login
- Username: `admin`
- Password: `admin123`

## Build for Production
```bash
ng build --configuration production
```
