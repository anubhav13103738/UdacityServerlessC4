import 'source-map-support/register';
import * as uuid from 'uuid';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {addAttachment, getPresignedUrl} from '../../bl/todo';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // const todoId = event.pathParameters.todoId;
  const imageId:uuid = uuid.v4();
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const presignedUrl = await getPresignedUrl(imageId);

  console.log("presignedURL as in generateuploadurl:",presignedUrl);
  
  const imageUrl = await addAttachment(event, imageId);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
        uploadUrl: presignedUrl,
        imageUrl: imageUrl
    })
  };
}
