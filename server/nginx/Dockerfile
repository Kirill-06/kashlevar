FROM nginx

ARG NGINX_CONF
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
