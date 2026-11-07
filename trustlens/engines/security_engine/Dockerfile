FROM rust:1.75 as builder

WORKDIR /usr/src/security_engine

RUN apt-get update && apt-get install -y libssl-dev pkg-config && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/security_engine/target/release/security_engine /usr/local/bin/security_engine

EXPOSE 8001

CMD ["security_engine"]
