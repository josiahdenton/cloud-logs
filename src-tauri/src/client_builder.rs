use anyhow::Result;
use aws_config::BehaviorVersion;
use aws_sdk_cloudwatchlogs::Client;
use headers::Authorization;
use hyper::Uri;
use hyper_proxy2::{Intercept, Proxy, ProxyConnector};
use hyper_util::client::legacy::connect::HttpConnector;
use url::Url;

pub const US_EAST: &str = "us-east-1";
pub const US_WEST: &str = "us-west-2";

pub fn determine_proxy() -> Option<ProxyConnector<HttpConnector>> {
    let proxy_url: Url = std::env::var("https_proxy").ok()?.parse().ok()?;
    let proxy_uri: Uri = std::env::var("https_proxy").ok()?.parse().ok()?;
    let mut proxy = Proxy::new(Intercept::All, proxy_uri);

    if let Some(password) = proxy_url.password() {
        proxy.set_authorization(Authorization::basic(proxy_url.username(), password));
    }

    let connector = HttpConnector::new();
    Some(ProxyConnector::from_proxy(connector, proxy).unwrap())
}

pub async fn log_client_from_env(profile: &str, region: &str) -> Result<Client> {
    //let proxy_url: Url = std::env::var("https_proxy")?.parse().ok().expect("");
    //let proxy = Proxy::http(proxy_url)?;
    //let client = Client::builder().proxy(proxy).build()?;

    let proxy = determine_proxy().unwrap();
    //let client = aws_smithy_experimental::hyper_1_0::HyperClientBuilder::new().crypto_mode(provider).build_https();
    let client =
        aws_smithy_runtime::client::http::hyper_014::HyperClientBuilder::new().build(proxy);

    let shared_config = aws_config::defaults(BehaviorVersion::latest())
        .http_client(client)
        .profile_name(profile)
        .region(if region == US_EAST { US_EAST } else { US_WEST })
        .load()
        .await;

    Ok(Client::new(&shared_config))
}
