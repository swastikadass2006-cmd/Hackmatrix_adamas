# Stage 1: Build binary using the latest Rust compiler
FROM rust:latest AS builder

WORKDIR /usr/src/security_engine

RUN apt-get update && apt-get install -y libssl-dev pkg-config && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release

# Stage 2: Runtime image
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /usr/src/security_engine/target/release/security_engine /app/security_engine

EXPOSE 8001
CMD ["/app/security_engine"]
