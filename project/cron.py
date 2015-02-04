'''
Created on 2015-2-3

@author: liyan
'''
import logging
import models
import datetime
from django.http import HttpResponse

def my_scheduled_job(request):
#    logger = logging.getLogger(__name__)
#    logger.info("INFOFOFOFOFO")
#    logger.error("Something went wrong!")
    chart_pro = models.project_statistics.objects.filter(is_graph=1)
    results = []
    for item in chart_pro:
        results.append(models.project_statistics_result(project_id=item.project_id, sql_id=item.id,
                                                        date=datetime.datetime.now(), 
                                                        statistical_result=item.total, isactived=1))
    models.project_statistics_result.objects.bulk_create(results)
    return HttpResponse("123")
