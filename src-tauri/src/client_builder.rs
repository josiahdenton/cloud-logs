use aws_config::BehaviorVersion;
use aws_sdk_cloudwatchlogs::Client;

pub const US_EAST: &str = "us-east-1";
pub const US_WEST: &str = "us-west-2";

pub async fn log_client_from_env(profile: &str, region: &str) -> Client {
    let shared_config = aws_config::defaults(BehaviorVersion::latest())
        .profile_name(profile)
        .region(if region == US_EAST { US_EAST } else { US_WEST })
        .load()
        .await;
    Client::new(&shared_config)
}
