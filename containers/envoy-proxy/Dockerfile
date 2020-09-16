FROM envoyproxy/envoy-alpine:v1.14.1

ARG ssl_certs_dir=/etc/ssl-certs
WORKDIR $ssl_certs_dir

VOLUME $root_dir/localhost

EXPOSE 443
EXPOSE 80

CMD /usr/local/bin/envoy -c /etc/envoy-proxy.yaml --service-cluster envoy-proxy
