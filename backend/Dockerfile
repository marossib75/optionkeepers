
# Multi-stage builds (Docker 17.05+)

# Install node modules
FROM node AS build

RUN mkdir /build
WORKDIR /build
COPY app /build
RUN npm install
RUN npm run build

FROM python:3.8
ENV PYTHONUNBUFFERED=1

# Copy installed modules into this new container
RUN mkdir /assets
RUN mkdir /assets/js
COPY --from=build /build/node_modules/jquery /assets/jquery
COPY --from=build /build/node_modules/bootstrap /assets/bootstrap
COPY --from=build /build/node_modules/cookieconsent /assets/cookieconsent
COPY --from=build /build/node_modules/moment /assets/moment
COPY --from=build /build/node_modules/toastr /assets/toastr
COPY --from=build /build/js/build /assets/js/build

RUN mkdir /data
WORKDIR /data
COPY _config/requirements.txt /data/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
