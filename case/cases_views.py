# coding=utf-8
import datetime
import json, re
from django.shortcuts import render_to_response, redirect, RequestContext, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from models import testcase, casemodule, category, result
from forms import searchForm
from project.models import user, department
from project.views import isNone
from django.db.models import Q

#判断是否是技术部分的测试或者开发
def is_dev(uid):
	depid = user.objects.get(id=int(uid)).department_id
	if depid not in [1, 2, 4, 5, 12]:
		return False
	else:
		return True

#判断是否是测试部门的
def is_tester(uid):
	depid = user.objects.get(id=int(uid)).department_id
	print "depid------"
	print depid
	if depid != 1:
		return False
	else:
		return True


def case_list(request,pid):
	#没登陆的提示去登录
	if not request.user.is_authenticated():
		return HttpResponseRedirect("/case/login")
	#权限判断
	canope = True
	if not is_tester(request.session['id']):
		canope =  False
	else:
		child = category.objects.filter(parent_id = int(pid))
		if len(child):
			canope =  False


	kwargs={}
	case = {}
	cate1 = cate2 = cate3 = categoryid = ctestmodule = 	cpriority = cauthor = \
	cexecutor = cstart_date = cend_date = cexec_status = ckeyword =  cstatue = cmold = ''
	cmodule = testcase.objects.filter(isactived =1)

	if request.method == "POST":
		search = searchForm(request.POST)
		if search.is_valid():
			cate1 = search.cleaned_data['cate1']
			cate2 = search.cleaned_data['cate2']
			cate3 = search.cleaned_data['cate3']
			categoryid = search.cleaned_data['categoryid']
			ctestmodule = search.cleaned_data['testmodule']
			cpriority = search.cleaned_data['priority']
			cstatue = search.cleaned_data['status']
			cmold =  search.cleaned_data['mold']
			cauthor = search.cleaned_data['author']
			cexecutor = search.cleaned_data['executor']
			cstart_date = search.cleaned_data['start_date']
			cend_date = search.cleaned_data['end_date']
			cexec_status = search.cleaned_data['exec_status']
			ckeyword = search.cleaned_data['keyword']
			subset2 = list(category.objects.filter(parent_id = pid).values_list("id",flat=True))
			subset3 = list(category.objects.filter(parent_id__in = subset2))
			subset = list(set(subset2).union(set(subset3)))
			subset.append(pid)			
			if not isNone(pid):
				kwargs['category__in'] = subset				
			if not isNone(cauthor):
				kwargs['authorid'] = cauthor
			cmodule = testcase.objects.filter(**kwargs)
			if not isNone(cpriority):
				kwargs['priority'] = cpriority
			if not isNone(ckeyword):
				kwargs['action__contains'] = ckeyword
			cmodule = cmodule.filter(**kwargs)
			testmodule = casemodule.objects.filter(pk__in = cmodule.values_list("module",flat=True))
			caseresult = result.objects.filter(testcase__in = cmodule)
			if not isNone(ctestmodule):
				testmodule = testmodule.filter(m_name = ctestmodule)

			args = [Q(result = cmold) , ~Q(result = cmold)] 
			args2 = [~Q(pk__in = caseresult.values_list("testcase", flat=True).distinct()),Q(pk__in = caseresult.values_list("testcase", flat=True).distinct())]
			if not isNone(cmold) and not isNone(cstatue):
				if cmold == u"未执行":
					cmodule = cmodule.filter(args2[int(cstatue)])
				else:
					caseresult = caseresult.filter(args[int(cstatue)])
					cmodule = cmodule.filter(pk__in = caseresult.values_list("testcase", flat=True).distinct())
			if not isNone(cexecutor):
				caseresult = caseresult.filter(executor = cexecutor)
				cmodule = cmodule.filter(pk__in = caseresult.values_list("testcase", flat=True).distinct())
			if not isNone(cstart_date) or not isNone(cend_date):
				if not isNone(cstart_date):
					caseresult = caseresult.filter(exec_date__gte = cstart_date)
				if not isNone(cend_date):
					caseresult = caseresult.filter(exec_date__lte = cend_date)
				cdate = set(cmodule.values_list("id",flat = True))&(set(caseresult.values_list("testcase", flat=True)))
				cmodule = cmodule.filter(pk__in = cdate)
	else:
		try:
			clist = []
			first = get_object_or_404(category,pk = int(pid))
			clist.append(int(pid))
			if first.parent_id != 0:
				clist.append(first.parent_id)
				second = get_object_or_404(category,pk = first.parent_id)
				if second.parent_id !=0:
					clist.append(second.parent_id)
			catelen = len(clist)
			if catelen:
				cate1 = clist[-1]
				catelen = catelen-1;
			if catelen:
				cate2 = clist[-2]
				catelen = catelen-1;
			if catelen:
				cate3 = clist[-3]
		except Exception,e:
			pass
		subset2 = list(category.objects.filter(parent_id = pid).values_list("id",flat=True))
		subset3 = list(category.objects.filter(parent_id__in = subset2))
		subset = list(set(subset2).union(set(subset3)))		
		subset.append(pid)
		cmodule = testcase.objects.filter(category__in = subset)
		testmodule = casemodule.objects.filter(pk__in = cmodule.values_list("module", flat = True))
		caseresult = result.objects.filter(testcase__in = cmodule)
	listid = caseresult.values_list("testcase", flat=True).distinct()
	executorlist = caseresult.values_list("executor",flat = True).distinct()
	count = len(cmodule)
	newresult = []
	for c in listid:
		p = caseresult.filter(testcase = c).order_by("-exec_date")[0]
		newresult.append(p)
	for m in testmodule:
		case[m.id] = cmodule.filter(module = m.id).order_by("rank")
	return render_to_response("case/case_list.html", {"case":case, "testmodule":testmodule, "count":count,"result":newresult, "listid":listid,"categoryid":categoryid, "cauthor":cauthor, 
		                      "cpriority":cpriority, "statue":cstatue, "mold":cmold, "ckeyword":ckeyword, "ctestmodule":ctestmodule, "cexecutor":cexecutor, "cstart_date":cstart_date, 
		                      "cend_date":cend_date, "cate1":cate1, "cate2":cate2, "cate3":cate3, "canope":canope, "executorlist":executorlist})

def allcaselist(request):

	#没登陆的提示去登录
	if not request.user.is_authenticated():
		return HttpResponseRedirect("/case/login")

	kwargs={}
	case = {}
	ctestmodule = cpriority = cauthor = cexecutor = cstart_date = cend_date = \
	cexec_status = ckeyword =  cstatue = cmold = ''
	cmodule = testcase.objects.filter(isactived = 1)
	if request.method == "POST":
		search = searchForm(request.POST)
		if search.is_valid():
			ctestmodule = search.cleaned_data['testmodule']
			cpriority = search.cleaned_data['priority']
			cstatue = search.cleaned_data['status']
			cmold =  search.cleaned_data['mold']
			cauthor = search.cleaned_data['author']
			cexecutor = search.cleaned_data['executor']
			cstart_date = search.cleaned_data['start_date']
			cend_date = search.cleaned_data['end_date']
			cexec_status = search.cleaned_data['exec_status']
			ckeyword = search.cleaned_data['keyword']
			if not isNone(cauthor):
				kwargs['author'] =  cauthor
			cmodule = testcase.objects.filter(**kwargs)
			if not isNone(cpriority):
				kwargs['priority'] = cpriority
			if not isNone(ckeyword):
				kwargs['action__contains'] = ckeyword
			cmodule = cmodule.filter(**kwargs)
			testmodule = casemodule.objects.filter(pk__in = cmodule.values_list("module",flat=True))
			caseresult = result.objects.filter(testcase__in = cmodule)
			if not isNone(ctestmodule):
				testmodule = testmodule.filter(m_name = ctestmodule)
			args = [Q(result = cmold) , ~Q(result = cmold)] 
			args2 = [~Q(pk__in = caseresult.values_list("testcase", flat=True).distinct()),Q(pk__in = caseresult.values_list("testcase", flat=True).distinct())]
			if not isNone(cmold) and not isNone(cstatue):
				if cmold == u"未执行":
					cmodule = cmodule.filter(args2[int(cstatue)])
				else:
					caseresult = caseresult.filter(args[int(cstatue)])
					cmodule = cmodule.filter(pk__in = caseresult.values_list("testcase", flat=True).distinct())
			if not isNone(cexecutor):
				caseresult = caseresult.filter(executor = cexecutor)
				cmodule = cmodule.filter(pk__in = caseresult.values_list("testcase", flat=True).distinct())
			if not isNone(cstart_date) or not isNone(cend_date):
				if not isNone(cstart_date):
					caseresult = caseresult.filter(exec_date__gte = cstart_date)
				if not isNone(cend_date):
					caseresult = caseresult.filter(exec_date__lte = cend_date)
				cdate = set(cmodule.values_list("id",flat = True))&(set(caseresult.values_list("testcase", flat=True)))
				cmodule = cmodule.filter(pk__in = cdate)
	else:
		testmodule = casemodule.objects.filter(pk__in = cmodule.values_list("module", flat = True))
		caseresult = result.objects.filter(testcase__in = cmodule)
	listid = caseresult.values_list("testcase", flat=True).distinct()
	executorlist = caseresult.values_list("executor",flat = True).distinct()
	count =len(cmodule)
	newresult = []
	for c in listid:
		p = caseresult.filter(testcase = c).order_by("-exec_date")[0]
		newresult.append(p)
	for m in testmodule:
		case[m.id] = cmodule.filter(module = m.id).order_by("rank")
	return render_to_response("case/case_list.html", {"case":case, "testmodule":testmodule, "result":newresult, "listid":listid, "count":count, "cauthor":cauthor, 
		                      "cpriority":cpriority, "statue":cstatue, "mold":cmold, "ckeyword":ckeyword, "ctestmodule":ctestmodule, "cexecutor":cexecutor, "cstart_date":cstart_date, 
		                      "cend_date":cend_date, "canope": False, "executorlist":executorlist})


def categorysearch(request):
	clist = []
	#一级
	# master = category.objects.filter(parent_id__isnull=True)
	master = category.objects.filter(parent_id = 0, isactived = 1)
	#二级
	for m in master:
		categorydic = {}
		s = {}
		categorydic["master"]=m.name
		categorydic["masterid"] = m.id
		second = category.objects.filter(parent_id = m.id, isactived = 1)
		slist = []
		ms = []
		for s in second:
			msdic = {}					
			msdic["second"] = s.name
			msdic["secondid"] = s.id			
			third = category.objects.filter(parent_id = s.id, isactived = 1)			
			td = []
			for t in third:
				thirdic = {}			
				thirdic["third"]=t.name
				thirdic["thirdid"] = t.id
				td.append(thirdic)
			msdic["thirdlist"]=td
			ms.append(msdic)
		categorydic["slist"]=ms
		clist.append(categorydic)
	# print clist
	return HttpResponse(json.dumps(clist))

def exec_log(request,pid):
	clist={}
	record = []
	loglist = result.objects.filter(testcase_id = int(pid))
	execrecord = list(loglist.values_list("result", flat = True))
	clist["Pass"] = execrecord.count("Pass")
	record.append(clist);
	for item in loglist:
		recorddic = {}
		recorddic["date"] = (item.exec_date).strftime("%Y-%m-%d %H:%M:%S")
		recorddic["executor"] = item.executor
		recorddic["result"] = item.result
		recorddic["remark"] = item.r_remark
		record.append(recorddic)
	return HttpResponse(json.dumps(record))

def execute_case(request):
	resp = {}
	#判断下权限
	if not is_dev(request.session['id']):
		resp["success"] = False
		resp["message"] = "no permit"
		resp = json.dumps(resp)
		return HttpResponse(resp)

	try:
		caseid = request.POST['caseid']
		cresult = request.POST['cresult']
		executor = request.session['realname']
		executorid = request.session['id']
		exec_date = datetime.datetime.now()
		cr = result(testcase_id=caseid, result=cresult, exec_date=exec_date, executor=executor, executorid=executorid, isactived=1)
		cr.save()
		exedetail = {}
		exedetail['exec_date'] = exec_date.strftime("%Y-%m-%d %H:%M:%S")
		exedetail['executor'] = executor 
		resp["success"] = True
		resp["exedetail"] = exedetail
	except Exception, e:
		resp["success"] = False
		resp["message"] = e
	finally:	
		resp = json.dumps(resp)

		return HttpResponse(resp)


def update_rank(request):
	resp = {}
	#判断下权限
	if not is_tester(request.session['id']):
		resp["success"] = False
		resp["message"] = "no permit"
		resp = json.dumps(resp)
		return HttpResponse(resp)
	try:
		rank_dict = json.loads(request.POST['rankdict'])
		module_id = request.POST['mid']

		if int(module_id):#更新用例rank
			for key in rank_dict.keys():
				tc = testcase.objects.get(id=key)
				tc.rank = rank_dict[key]
				if int(module_id) != -1:
					tc.module_id = module_id
				tc.save()
		else:#更新模块rank
			for key in rank_dict.keys():
				md = casemodule.objects.get(id=key)
				md.rank = rank_dict[key]
				md.save()
			
		resp["success"] = True
	except Exception,e:
		resp["success"] = False
		print e
		# resp["message"] = e
	finally:
		resp = json.dumps(resp)
		# print "resp==",resp

		return HttpResponse(resp)

def moduledel(request):
	resp = {}
	#判断下权限
	if not is_tester(request.session['id']):
		resp["success"] = False
		resp["message"] = "no permit"
		resp = json.dumps(resp)
		return HttpResponse(resp)

	mid = request.POST['mid']
	try:
		delmodule = get_object_or_404(casemodule, pk=int(mid))
		delmodule.isactived = 0
		delmodule.save()
		# delmodule.delete()
		resp["success"] = True
	except Exception,e:
		resp["success"] = False
	finally:
		resp = json.dumps(resp)
		return HttpResponse(resp)

def delete_case(request):

	resp = {}
	#判断下权限
	if not is_tester(request.session['id']):
		resp["success"] = False
		resp["message"] = "no permit"
		resp = json.dumps(resp)
		return HttpResponse(resp)

	deleteid = request.POST['did']
	deleteid = deleteid.replace(" ", "").split(",")
	
	try:
		for did in deleteid:
			if len(did):
				delcase = get_object_or_404(testcase, pk=int(did))
				delcase.isactived = 0
				delcase.save()
		resp["success"] = True
	except Exception, e:
		resp["success"] = False
	finally:
		resp = json.dumps(resp)
		return HttpResponse(resp)

def update_case_related(request):
	resp = {}
	#判断下权限
	if not is_dev(request.session['id']):
		resp["success"] = False
		resp["message"] = "no permit"
		resp = json.dumps(resp)
		return HttpResponse(resp)
	tname = request.POST['tname']
	tcnt = request.POST['tcnt']
	cid = request.POST['tid']
		
	try:
		trs = result.objects.filter(testcase_id=cid).order_by("-id")[0]
		if trs:
			if tname == "wi":
				trs.wi = tcnt
			else:
				trs.r_remark = tcnt

			trs.save()
			resp["success"] = True
	except Exception, e:
		resp["success"] = False
		print e
	finally:
		resp = json.dumps(resp)
		return HttpResponse(resp)

def savecase(request):
	dict = {}
	#判断下权限
	if not is_tester(request.session['id']):
		dict["message"] = False
		dict = json.dumps(dict)
		return HttpResponse(dict)

	try:
		url = request.META['HTTP_REFERER']
		p = re.compile(r'\d+')
		pid = (p.findall(url))[-1]
		dt = json.loads(request.POST.get('datas',False))
		for data in dt:
			for key,value in data.items():
				for ddata in value:
					if key == "-1":
						cm = casemodule(m_name = ddata['mname'],m_rank = ddata['mrank'], isactived = 1)
						cm.save()
						key = cm.id
					else:
						updatemodule = casemodule.objects.filter(pk = key).update(m_name = ddata['mname'])
					caseid = ddata['id']
					if caseid != -3:
						cpre = ddata['precon']
						cinput = ddata['action']
						couput = ddata['output']
						cpriority = ddata['priory']
						crank = ddata['rank']
						if caseid:
							updatecase = testcase.objects.filter(pk = caseid).update(precondition = cpre, \
								action = cinput, output = couput, priority = cpriority)
						else:
							newcase = testcase(category_id = pid, rank = crank, module_id = key, precondition = cpre, \
								action = cinput, output = couput, priority = cpriority, author = request.session['realname'], \
								authorid = request.session['id'], createdate = datetime.datetime.now(), isactived = '1')
							newcase.save()
		dict['message']= True
	except Exception,e: 
		import sys 
		info = "%s || %s" % (sys.exc_info()[0], sys.exc_info()[1])
		dict['message']=False
		print e 
	finally:
		cjson=json.dumps(dict) 
	return HttpResponse(cjson)