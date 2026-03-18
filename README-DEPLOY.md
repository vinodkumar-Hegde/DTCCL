# AWS ECS Deployment Instructions

## Prerequisites
- AWS account with ECS, ECR, and IAM permissions
- GitHub repository with this project
- AWS CLI configured locally (for manual steps)

## Steps

1. **Set up AWS ECR repository**
   - Create an ECR repo named `doctutorials-ccl` in your AWS account.

2. **Configure GitHub Secrets**
   - In your GitHub repo, add these secrets:
     - `AWS_ACCOUNT_ID`: Your AWS account ID
     - `AWS_REGION`: Your AWS region (e.g., us-east-1)
     - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: For GitHub Actions to push to ECR and deploy to ECS
     - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`: Your Supabase credentials

3. **Review ECS Task Definition**
   - Update `ecs-task-def.json` with your actual AWS account ID, region, and role ARN.

4. **Push to main branch**
   - On push to `main`, GitHub Actions will build, push Docker image to ECR, and deploy to ECS.

5. **ECS Service/Cluster**
   - Ensure you have an ECS cluster and service named `doctutorials-ccl-cluster` and `doctutorials-ccl-service`.

6. **Access the app**
   - Once deployed, access via the ECS service's public endpoint.

---

For troubleshooting, check GitHub Actions logs and AWS ECS/ECR console.
